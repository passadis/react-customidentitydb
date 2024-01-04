# Create Azure Key Vault
data "azurerm_client_config" "current" {}
resource "azurerm_key_vault" "keyvault" {
  name                        = "kv${var.random_string}"
  location                    = var.location
  resource_group_name         = var.azurerm_resource_group
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  purge_protection_enabled    = false
  sku_name                    = "standard"
  enable_rbac_authorization   = true
  public_network_access_enabled = true
}
resource "azurerm_role_assignment" "role1" {
  scope                = azurerm_key_vault.keyvault.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}
resource "azurerm_role_assignment" "role2" {
  scope                = azurerm_key_vault.keyvault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.azurerm_user_assigned_identity_id
}
resource "azurerm_key_vault_secret" "sql_admin_username" {
  name         = "sql-admin-username"
  value        = var.sql_admin_username
  key_vault_id = azurerm_key_vault.keyvault.id 
}
resource "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  value        = var.sql_admin_password
  key_vault_id = azurerm_key_vault.keyvault.id   
}
resource "azurerm_key_vault_secret" "sql_server_name" {
  name         = "sql-server-name"
  value        = var.sql_server_name
  key_vault_id = azurerm_key_vault.keyvault.id   
}
resource "azurerm_key_vault_secret" "sql_database_name" {
  name         = "sql-database-name"
  value        = var.azurerm_mssql_database
  key_vault_id = azurerm_key_vault.keyvault.id   
}
# Create Key Vault Secret for Storage Account
resource "azurerm_key_vault_secret" "storage_account_name" {
  name         = "storage-account-name"
  value        = var.azurerm_storage_account
  key_vault_id = azurerm_key_vault.keyvault.id   
}
# Create Key Vault Secret for Storage Account Connection String
resource "azurerm_key_vault_secret" "storage_account_connection_string" {
  name         = "storage-account-connection-string"
  value        = var.azurerm_storage_account_string
  key_vault_id = azurerm_key_vault.keyvault.id   
}
# Create Key Vault Random JWT Secret
resource "random_password" "jwt_secret" {
  length           = 32
  special          = false
  override_special = "_%@"
}
# Store JWT Secret in Key Vault
resource "azurerm_key_vault_secret" "jwtsecret" {
name    = "jwt-secret"
value   = random_password.jwt_secret.result
key_vault_id = azurerm_key_vault.keyvault.id
}