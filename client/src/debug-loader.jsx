console.log('Debug loader starting');
const root = document.getElementById('root');

async function testImports() {
    try {
        console.log('Testing React import...');
        await import('react');
        console.log('React OK');

        console.log('Testing ReactDOM import...');
        await import('react-dom/client');
        console.log('ReactDOM OK');

        console.log('Testing App import...');
        await import('./App.jsx');
        console.log('App OK');

        console.log('Testing Main import...');
        await import('./main.jsx');
        console.log('Main OK');
    } catch (e) {
        console.error('Import failed:', e);
        root.innerHTML = `<div style="color: red; padding: 20px; font-size: 24px;">
            <h1>Load Error</h1>
            <p>${e.message}</p>
            <pre>${e.stack}</pre>
        </div>`;
    }
}

testImports();
