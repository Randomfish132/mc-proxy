const varint = require( 'varint' );

const State  = require( '../state.js' );
const Packet = require( './packet.js' );

class Handshake extends Packet {
   constructor( version, address, port, nextState ) {
      super( State.HANDSHAKING, 0 );

      this.version = version;
      this.address = address;
      this.port    = port;

      this.nextState = nextState;
   }

   encode() {
      let portBuffer = Buffer.alloc( 2 );
      portBuffer.writeUint16BE( this.port, 0 );

      return this.createPacket( Buffer.concat( [
         Buffer.from( varint.encode( this.version ) ),
         Buffer.from( varint.encode( this.address.length ) ),
         Buffer.from( this.address, 'utf8' ),
         portBuffer,
         Buffer.from( varint.encode( this.nextState ) )
      ] ) );
   }

   static decode( buffer ) {
      let offset = 0;

      let version = varint.decode( buffer, offset );
      offset += varint.decode.bytes;

      let addressLength = varint.decode( buffer, offset );
      offset += varint.decode.bytes;

      let address = buffer.toString( 'utf8', offset, offset + addressLength );
      offset += addressLength;

      let port = buffer.readUInt16BE( offset );
      offset += 2;

      let nextState = varint.decode( buffer, offset );

      return new Handshake( version, address, port, nextState );
   }
}

module.exports = { Handshake };
