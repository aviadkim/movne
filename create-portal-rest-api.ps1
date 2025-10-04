# WordPress REST API Portal Page Creator
Write-Host "🌐 Creating Portal Page via WordPress REST API..." -ForegroundColor Cyan

$username = "aviad@kimfo-fs.com"
$password = "Kimfo1982"
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$username`:$password"))

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Basic $credentials"
}

# Load portal content
try {
    $portalContent = Get-Content 'portal-content-temp.html' -Raw -ErrorAction Stop
    Write-Host "✅ Portal content loaded ($($portalContent.Length) characters)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error loading portal content: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$body = @{
    title = "פורטל משקיעים - עמוד 2 - REST API"
    slug = "portal-page-2-rest-api"
    content = $portalContent
    status = "publish"
} | ConvertTo-Json -Depth 10

try {
    Write-Host "📤 Sending request to WordPress REST API..." -ForegroundColor Yellow

    $response = Invoke-RestMethod -Uri "https://movne.co.il/wp-json/wp/v2/pages" -Method POST -Headers $headers -Body $body

    Write-Host "🎉 SUCCESS! Page created via REST API!" -ForegroundColor Green
    Write-Host "📝 Page ID: $($response.id)" -ForegroundColor White
    Write-Host "🔗 Page URL: $($response.link)" -ForegroundColor White
    Write-Host "📊 Status: $($response.status)" -ForegroundColor White
    Write-Host "🏷️ Slug: $($response.slug)" -ForegroundColor White

    # Test the page
    Write-Host "`n🧪 Testing the created page..." -ForegroundColor Cyan

    try {
        $testResponse = Invoke-WebRequest -Uri $response.link -Method GET
        $hasContent = $testResponse.Content.Length -gt 1000

        Write-Host "📊 Test Results:" -ForegroundColor Yellow
        Write-Host "   Content Length: $($testResponse.Content.Length) characters" -ForegroundColor White
        Write-Host "   Status Code: $($testResponse.StatusCode)" -ForegroundColor White
        Write-Host "   Has Content: $(if ($hasContent) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($hasContent) { 'Green' } else { 'Red' })

        if ($hasContent) {
            Write-Host "`n🎯 Portal page is working! You can view it at:" -ForegroundColor Green
            Write-Host $response.link -ForegroundColor Cyan
        } else {
            Write-Host "`n⚠️ Page created but content appears to be blank" -ForegroundColor Yellow
        }

    } catch {
        Write-Host "⚠️ Could not test page: $($_.Exception.Message)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ Error creating page:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error Details: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n✅ REST API Portal Creator completed!" -ForegroundColor Green