// Real-time layer. The server only broadcasts "something changed";
// each client re-fetches the data it is allowed to see. This keeps
// student names out of the public socket channel.
const { Server } = require('socket.io');

let io = null;

exports.init = (httpServer, origins) => {
  io = new Server(httpServer, { cors: { origin: origins, methods: ['GET', 'POST'] } });
  io.on('connection', () => {});
  return io;
};

exports.emitChange = () => {
  if (io) io.emit('lab:changed');
};
