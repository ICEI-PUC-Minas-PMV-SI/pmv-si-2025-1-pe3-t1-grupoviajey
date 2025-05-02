import subprocess
import os
import threading
import time
import socket
import sys
from wsgiref.simple_server import make_server

# Porta para o servidor Node.js
NODE_PORT = 3000

# Definir o diretório raiz
base_dir = os.path.abspath(os.path.dirname(__file__))
node_process = None

# Iniciar o processo Node.js em um thread separado
def start_node_server():
    global node_process
    
    # Certificar-se de que não há outro processo rodando
    if node_process is not None:
        try:
            node_process.terminate()
            node_process.wait(timeout=5)
        except:
            pass
    
    # Iniciar o servidor Node.js na porta NODE_PORT
    try:
        # Configurar a variável de ambiente PORT para o servidor Node.js
        env = os.environ.copy()
        env['PORT'] = str(NODE_PORT)
        
        node_process = subprocess.Popen(
            ["node", "server.js"],
            cwd=base_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env
        )
        
        print(f"Servidor Node.js iniciado na porta {NODE_PORT}!")
        
        # Aguardar o servidor iniciar
        time.sleep(2)
        
        # Monitorar e imprimir a saída do Node.js em um thread separado
        def print_output():
            for line in iter(node_process.stdout.readline, b''):
                print(line.decode().strip())
        
        threading.Thread(target=print_output, daemon=True).start()
        
    except Exception as e:
        print(f"Erro ao iniciar o servidor Node.js: {e}")

# Iniciar o servidor Node.js em segundo plano
threading.Thread(target=start_node_server, daemon=True).start()

# Função para verificar se o servidor Node.js está respondendo
def is_node_server_running():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        s.connect(('localhost', NODE_PORT))
        s.close()
        return True
    except:
        return False

# Função WSGI para o Gunicorn
def app(environ, start_response):
    # Inicializar resposta
    content_type = 'text/html; charset=utf-8'
    status = '200 OK'
    
    # Verificar se o servidor Node.js está respondendo
    if not is_node_server_running():
        # Tentar reiniciar o servidor Node.js
        print("Servidor Node.js não está respondendo. Tentando reiniciar...")
        threading.Thread(target=start_node_server, daemon=True).start()
        
        # Aguardar até 5 segundos pela reinicialização
        for _ in range(10):
            time.sleep(0.5)
            if is_node_server_running():
                break
    
    if is_node_server_running():
        # Encaminhar a solicitação para o servidor Node.js
        try:
            path_info = environ.get('PATH_INFO', '/')
            query_string = environ.get('QUERY_STRING', '')
            
            if query_string:
                redirect_path = f'http://localhost:{NODE_PORT}{path_info}?{query_string}'
            else:
                redirect_path = f'http://localhost:{NODE_PORT}{path_info}'
            
            headers = [
                ('Location', redirect_path),
                ('Content-Type', content_type)
            ]
            start_response('302 Found', headers)
            return [b'Redirecting...']
        except Exception as e:
            status = '500 Internal Server Error'
            response = f"""
            <html>
            <head><title>Erro ao redirecionar</title></head>
            <body>
                <h1>Erro ao redirecionar para o servidor Node.js</h1>
                <p>{str(e)}</p>
            </body>
            </html>
            """
    else:
        # O servidor Node.js não está respondendo
        status = '500 Internal Server Error'
        response = """
        <html>
        <head><title>Erro no servidor</title></head>
        <body>
            <h1>Erro ao iniciar o servidor Node.js</h1>
            <p>O servidor Node.js não está respondendo. Verifique os logs para mais informações.</p>
        </body>
        </html>
        """
    
    # Se chegamos aqui, é porque houve um erro
    headers = [('Content-Type', content_type)]
    start_response(status, headers)
    return [response.encode('utf-8')]

if __name__ == "__main__":
    # Quando executado diretamente, iniciar o servidor WSGI
    print("Iniciando o servidor WSGI...")
    httpd = make_server('', 5000, app)
    print("Servidor WSGI iniciado na porta 5000")
    httpd.serve_forever()