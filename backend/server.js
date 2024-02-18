import dotenv from 'dotenv';
import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import azureStorage from 'azure-storage';
import getStream from 'into-stream';
import cors from 'cors';
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import rateLimit from 'express-rate-limit'; // Import rateLimit

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.use(express.json());

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests
app.use(limiter);


const vaultName = process.env.AZURE_KEY_VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(vaultUrl, credential);

async function getSecret(secretName) {
    const secret = await secretClient.getSecret(secretName);
    return secret.value;
}

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('photo');

let sqlConfig;
let storageAccountName;
let azureStorageConnectionString;
let jwtSecret;

async function initializeApp() {
    sqlConfig = {
        user: await getSecret("sql-admin-username"),
        password: await getSecret("sql-admin-password"),
        database: await getSecret("sql-database-name"),
        server: await getSecret("sql-server-name"),
        options: {
            encrypt: true,
            trustServerCertificate: false
        }
    };

    storageAccountName = await getSecret("storage-account-name");
    azureStorageConnectionString = await getSecret("storage-account-connection-string");
    jwtSecret = await getSecret("jwt-secret");

    app.listen(process.env.PORT || 3001, () => console.log(`Server is running on port ${process.env.PORT || 3001}`));
}

// Upload photo endpoint
app.post('/uploadphoto', uploadStrategy, (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const blobName = `userphotos/${Date.now()}_${req.file.originalname}`;
    const stream = getStream(req.file.buffer);
    const streamLength = req.file.buffer.length;
    const blobService = azureStorage.createBlobService(azureStorageConnectionString);

    blobService.createBlockBlobFromStream('pics', blobName, stream, streamLength, err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading the file');
        } else {
            const photoUrl = `https://${storageAccountName}.blob.core.windows.net/pics/${blobName}`;
            res.status(200).send({ photoUrl });
        }
    });
});

// Register endpoint
app.post('/register', uploadStrategy, async (req, res) => {
    const { firstName, lastName, username, password, department, position } = req.body;
    if (!password) {
        return res.status(400).send({ message: 'Password is required' });
    }

    let photoUrl = '';
    if (req.file) {
        const blobName = `userphotos/${Date.now()}_${req.file.originalname}`;
        const stream = getStream(req.file.buffer);
        const streamLength = req.file.buffer.length;
        const blobService = azureStorage.createBlobService(azureStorageConnectionString);

        await new Promise((resolve, reject) => {
            blobService.createBlockBlobFromStream('pics', blobName, stream, streamLength, err => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    photoUrl = `https://${storageAccountName}.blob.core.windows.net/pics/${blobName}`;
                    resolve();
                }
            });
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('firstname', sql.NVarChar, firstName)
            .input('lastname', sql.NVarChar, lastName)
            .input('department', sql.NVarChar, department)
            .input('position', sql.NVarChar, position)
            .input('photoUrl', sql.NVarChar, photoUrl)
            .query(`
                INSERT INTO Users 
                (Username, PasswordHash, FirstName, LastName, Department, Position, PhotoUrl) 
                VALUES 
                (@username, @password, @firstName, @lastName, @department, @position, @photoUrl)
            `);

        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('username', sql.NVarChar, req.body.username)
            .query('SELECT UserId, PasswordHash FROM Users WHERE Username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(req.body.password, user.PasswordHash);

        if (!validPassword) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ UserId: user.UserId }, jwtSecret, { expiresIn: '1h' });
        res.send({ token: token, UserId: user.UserId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error logging in' });
    }
});

// Get user data endpoint
app.get('/user/:UserId', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('UserId', sql.Int, req.params.UserId) // Corrected line
            .query('SELECT Username, FirstName, LastName, Department, Position, PhotoUrl FROM Users WHERE UserId = @UserId');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user = result.recordset[0];
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching user data' });
    }
});

initializeApp().catch(error => {
    console.error("Error initializing application:", error);
});
