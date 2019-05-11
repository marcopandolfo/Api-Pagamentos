const cluster = require('cluster');
const os = require('os');

const cpus = os.cpus();

if (cluster.isMaster) {
    console.log('thread master');

    cpus.forEach(() => {
        cluster.fork();
    });

    cluster.on('listening', worker => {
        console.log('cluster conectado ' + worker.process.pid);
    });

    cluster.on('exit', worker => {
        console.log('cluster %d desconectado', worker.process.pid);
        cluster.fork();
    });

} else {
    console.log('thread slave');
    require('./index');
}

//Slave = threads filhas