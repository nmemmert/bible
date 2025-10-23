from flask import Flask

app = Flask(__name__)

@app.route('/test')
def test():
    return 'Hello World'

if __name__ == '__main__':
    app.run(port=5000)