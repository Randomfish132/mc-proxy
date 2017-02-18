const net   = require( 'net' );
const debug = require( 'debug' );

const config = require( '../config.json' );

let debugSocket = debug( 'socket' );

function socketListener( s ) {
   debugSocket( 'new connection' );

   s.on( 'data', chunk => {
      debugSocket( `new chunk of length ${chunk.length} recieved.` );
   } );

   s.on( 'end', () => {
      debugSocket( 'disconnected' );
   } );
}

const server = net.createServer( {}, socketListener );

server.on( 'error', err => {
   throw err;
} );

server.listen( config.port, () => {
   console.log( 'Server started on port:', config.port );
} );
