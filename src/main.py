import subprocess
import os
import sys
import signal
import atexit
from flask import Flask

app = Flask(__name__)

# Variável global para armazenar o processo do Node.js
node_process = None

def start_node_server():
    """Inicia o servidor Node.js em segundo plano"""
    global node_process
    try:
        # Tente iniciar o servidor Node.js
        node_process = subprocess.Popen(["node", "main.js"])
        print(f"Servidor Node.js iniciado com PID {node_process.pid}")
        
        # Registrar uma função para finalizar o processo quando o Flask for encerrado
        def cleanup():
            if node_process and node_process.poll() is None:  # Verifica se o processo ainda está em execução
                print(f"Encerrando servidor Node.js (PID: {node_process.pid})")
                node_process.terminate()
                node_process.wait(timeout=5)  # Espera até 5 segundos
        
        atexit.register(cleanup)
        
        return True
    except Exception as e:
        print(f"Erro ao iniciar servidor Node.js: {e}")
        return False

@app.route('/')
def home():
    # Inicia o servidor Node.js se ainda não estiver rodando
    global node_process
    if node_process is None or node_process.poll() is not None:
        start_node_server()
    
    # Redireciona para o servidor Node.js, usando o mesmo protocolo (http/https)
    return """
    Redirecionando para o servidor Node.js...
    <script>
        // Usa o mesmo protocolo (http/https) do navegador atual
        window.location.href = window.location.protocol + '//' + window.location.hostname + ':3000';
    </script>
    """

@app.route('/start-node')
def start_node():
    """Endpoint para iniciar o servidor Node.js manualmente"""
    success = start_node_server()
    return f"Tentativa de iniciar servidor Node.js: {'Sucesso' if success else 'Falha'}"

@app.route('/node-status')
def node_status():
    """Verifica o status do servidor Node.js"""
    global node_process
    if node_process is None:
        return "Servidor Node.js não foi iniciado"
    elif node_process.poll() is None:
        return f"Servidor Node.js está em execução (PID: {node_process.pid})"
    else:
        return f"Servidor Node.js foi encerrado (código de saída: {node_process.returncode})"

# Iniciar o servidor Node.js quando o aplicativo Flask inicia
start_node_server()

if __name__ == "__main__":
    # Inicia o servidor Flask
    app.run(host="0.0.0.0", port=5000)