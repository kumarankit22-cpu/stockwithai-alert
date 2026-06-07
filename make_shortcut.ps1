$exePath = 'C:\Users\kumar\Desktop\StockwithAI\Alarm\ForexAlertApp_v3\ForexAlertApp_v5\ForexAlertApp\dist\ForexPriceAlert 1.0.0.exe'
$iconPath = 'C:\Users\kumar\Desktop\StockwithAI\Alarm\ForexAlertApp_v3\ForexAlertApp_v5\ForexAlertApp\icon.ico'
$shortcutPath = [Environment]::GetFolderPath('Desktop') + '\StockwithAi Alert.lnk'
$WS = New-Object -ComObject WScript.Shell
$SC = $WS.CreateShortcut($shortcutPath)
$SC.TargetPath = $exePath
$SC.WorkingDirectory = Split-Path $exePath
$SC.IconLocation = "$iconPath, 0"
$SC.Description = 'StockwithAi By Ankit Kumar - Forex & Index Price Alert'
$SC.Save()
Write-Host "Shortcut created: $shortcutPath"
