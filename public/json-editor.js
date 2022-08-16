import { html } from 'html-express-js';

export const view = ({ data, activeRequestUrl, pendingRequests }, state) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>json editor</title>
      <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/jsoneditor@9.9.0/dist/jsoneditor.min.js"
      ></script>
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/jsoneditor@9.9.0/dist/jsoneditor.min.css" />
    </head>

    <style type="text/css">
    #jsoneditor {
      height: 800px;
    }
  </style>

    <body>
      <h3>${activeRequestUrl}</h3>
      <h5>${parseInt(pendingRequests) || '0'} pending requests... (may more be loading, refresh if unsure)</h5>
      <div id="jsoneditor"></div>
      <button onclick="save()">Save</button>
      <button onclick="clearRequests()">Clear Requests</button>
      <script type="text/javascript">
      const data = ${JSON.stringify(data)};
      const activeRequestUrl = '${activeRequestUrl}';
      const jsoneditor = document.getElementById('jsoneditor');
      if (data.isLoading) {
        jsoneditor.innerHTML = 'Loading...';
      } else {
        var editor = new JSONEditor(document.getElementById('jsoneditor'),{modes: ['text', 'tree']});
        editor.set(data);
      }
      function save() {
        if (data.isLoading) {
          return;
        }
        const newData = editor.get();
        fetch('/new-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({newData, activeRequestUrl})
        }).then(res => {
          if (res.ok) {
            setTimeout(() => {
              console.log('refreshing page');
              window.location.reload();
            }, 100);
          }
        })
      }
      function clearRequests() {
        fetch('/clear-requests').then(res => window.location.reload());
      }
       
      </script>
    </body>
  </html>
`;
