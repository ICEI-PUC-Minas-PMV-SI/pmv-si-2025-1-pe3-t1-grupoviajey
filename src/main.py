import os
import subprocess

def app(environ, start_response):
    # Inicializar resposta
    content_type = 'text/html; charset=utf-8'
    
    # Executar diretamente o script start.sh para iniciar o servidor Node.js
    try:
        subprocess.Popen(["./start.sh"], shell=True)
        
        # Redirecionar para o servidor Node.js
        redirect_path = 'http://localhost:3000'
        
        headers = [
            ('Location', redirect_path),
            ('Content-Type', content_type)
        ]
        start_response('302 Found', headers)
        return [b'Redirecting to Node.js server...']
    except Exception as e:
        status = '500 Internal Server Error'
        response = f"""
        <html>
        <head><title>Erro ao iniciar servidor</title></head>
        <body>
            <h1>Erro ao iniciar o servidor Node.js</h1>
            <p>{str(e)}</p>
        </body>
        </html>
        """
        headers = [('Content-Type', content_type)]
        start_response(status, headers)
        return [response.encode('utf-8')]