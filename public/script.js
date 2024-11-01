async function generateWebPage() {
    const prompt = document.getElementById("prompt").value;
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, repoName: 'generated-webpage' }),
    });
    const data = await response.json();
    document.getElementById("generatedCode").value = data.html || 'Error generating webpage';
    document.getElementById("status").innerText = data.message || 'Generation complete!';
}

async function deployWebPage() {
    document.getElementById("status").innerText = "Deployment in progress...";
    // You may add further deployment-related actions if needed
}
