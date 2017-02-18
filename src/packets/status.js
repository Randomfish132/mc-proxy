const varint = require( 'varint' );

const Long   = require( 'long' );

const State  = require( '../state.js' );
const Packet = require( './packet.js' );

const state = State.STATUS;

class Request extends Packet {
   constructor() {
      super( state, 0 );
   }

   encode() {
      return this.createPacket();
   }

   static decode( data ) {
      return new Request();
   }
}

class Response extends Packet {
   constructor( status ) {
      super( state, 0 );

      this.status = status;
   }

   encode() {
      let statusString = JSON.stringify( this.status );

      return this.createPacket( Buffer.concat( [
         Buffer.from( varint.encode( statusString.length ) ),
         Buffer.from( statusString, 'utf8' )
      ] ) );
   }

   static decode( buffer ) {
      let statusLength = varint.decode( buffer );

      let status = buffer.toString( 'utf8', varint.decode.length, varint.decode.length + statusLength );

      return new Response( JSON.parse( status ) );
   }
}

class Ping extends Packet {
   constructor( payload ) {
      super( state, 1 );

      this.payload = payload;
   }

   encode() {
      let payloadBuffer = Buffer.alloc( 8 );
      payloadBuffer.writeUInt32BE( this.payload.low , 0 );
      payloadBuffer.writeUInt32BE( this.payload.high, 0 );

      return this.createPacket( payloadBuffer );
   }

   static decode( buffer ) {
      let low  = buffer.readUInt32BE( buffer );
      let high = buffer.readUInt32BE( buffer, 4 );

      return new Ping( new Long( low, high ) );
   }
}

class Pong extends Packet {
   constructor( payload ) {
      super( state, 1 );

      this.payload = payload;
   }

   encode() {
      let payloadBuffer = Buffer.alloc( 8 );
      payloadBuffer.writeUInt32BE( this.payload.low , 0 );
      payloadBuffer.writeUInt32BE( this.payload.high, 0 );

      return this.createPacket( payloadBuffer );
   }

   static decode( buffer ) {
      let low  = buffer.readUInt32BE( buffer );
      let high = buffer.readUInt32BE( buffer, 4 );

      return new Pong( new Long( low, high ) );
   }
}

module.exports = { Request, Response, Ping, Pong };
