const net    = require( 'net' );
const debug  = require( 'debug' );
const varint = require( 'varint' );

const Long  = require( 'long' );
const State = require( './state.js' );

const Packet      = require( './packets/packet.js' );
const handshaking = require( './packets/handshaking.js' );
const status      = require( './packets/status.js' );

const config = require( '../config.json' );

let debugSocket = debug( 'socket' );

function socketListener( s ) {
   debugSocket( 'new connection' );

   s.info = {
      state    : State.HANDSHAKING,
      encrypted: false
   };

   function handlePacket( packet ) {
      let packetInfo = Packet.decode( packet );
      let packetData = packetInfo.packet;

      console.log( packetInfo );

      debugSocket( `recieved new packet #${packetInfo.id} of length ${packetInfo.length} at state: ${State.toString( s.info.state )}` );

      if( s.info.state === State.HANDSHAKING ) {
         if( packetInfo.id === 0 ) { // Handshake
            let handshake = handshaking.Handshake.decode( packetData );

            s.info.version = handshake.version;
            s.info.address = handshake.address;
            s.info.port    = handshake.port;
            s.info.state   = handshake.nextState;

            debugSocket( 'Handshake:', handshake );
         }

         return;
      }

      if( s.info.state === State.STATUS ) {
         if( packetInfo.id === 0 ) { // Request
            //TODO: add option to forward packet.

            let response = new status.Response( config.status );

            s.write( response.encode() );
         }

         if( packetInfo.id === 1 ) { // Ping
            //TODO: calculate forwarded ping?

            let ping = status.Ping.decode( packetData );

            let pong = new status.Pong( ping.payload );

            s.write( pong.encode() );
         }

         return;
      }
   }

   let chunkBuffer = Buffer.alloc( 0 );

   function handleChunk( chunk ) {
      // combine the buffer and latest chunk to be split into correct sized packets later.
      if( chunk )
         chunkBuffer = Buffer.concat( [ chunkBuffer, chunk ] );

      // don't attempt to process non-existent data.
      if( chunkBuffer.length === 0 )
         return;

      // get the current packet length.
      let packetLength = varint.decode( chunkBuffer );
      packetLength += varint.decode.bytes;

      // return if the buffer does not contain the full packet.
      if( packetLength > chunkBuffer.length )
         return;

      // if it does split it into its own buffer to be processed.
      let packet = Buffer.alloc( packetLength );
      chunkBuffer.copy( packet, 0, 0, packetLength );

      // remove the packet from the buffer.
      chunkBuffer = chunkBuffer.slice( packetLength, chunkBuffer.length );

      // handle packet and any remaing data in the buffer.
      handlePacket( packet );
      handleChunk();
   }

   s.on( 'data', handleChunk );

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
