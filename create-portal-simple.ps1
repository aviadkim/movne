# Simple Portal Page Creator - REST API
Write-Host "Creating Portal Page via WordPress REST API..." -ForegroundColor Cyan

$username = "aviad@kimfo-fs.com"
$password = "Kimfo1982"
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$username`:$password"))

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Basic $credentials"
}

# Load portal content
$portalContent = Get-Content 'portal-content-temp.html' -Raw

$bodyData = @{
    title = "Portal Investors Page 2 - REST API"
    slug = "portal-page-2-rest-api-working"
    content = $portalContent
    status = "publish"
}

$body = $bodyData | ConvertTo-Json -Depth 10

try {
    Write-Host "Sending request to WordPress..." -ForegroundColor Yellow

    $response = Invoke-RestMethod -Uri "https://movne.co.il/wp-json/wp/v2/pages" -Method POST -Headers $headers -Body $body

    Write-Host "SUCCESS! Page created!" -ForegroundColor Green
    Write-Host "Page ID: $($response.id)"
    Write-Host "Page URL: $($response.link)"
    Write-Host "Status: $($response.status)"

    # Test the page
    Write-Host "Testing page content..." -ForegroundColor Cyan
    $testResponse = Invoke-WebRequest -Uri $response.link -Method GET
    Write-Host "Content Length: $($testResponse.Content.Length) characters"

    Write-Host "Portal page URL: $($response.link)" -ForegroundColor Green

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Completed!" -ForegroundColor Green