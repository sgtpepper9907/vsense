import * as SerialPort from "serialport";
import { EventEmitter } from "events";
import Headset from './Headset';
import { Waves } from '../Interfaces/Waves';

const SYNC_BYTE = Buffer.from([0xAA]);
const EXCODE = 0x55;
const BATTERY = 0x01;
const POOR_SIGNAL = 0x02;
const ATTENTION = 0x04;
const MEDITATION = 0x05;
const BLINK = 0x16;
const RAW_VALUE = 0x80;
const ASIC_EEG_POWER = 0x83;
const HEADSET_CONNECTED = 0xD0;
const HEADSET_NOT_FOUND = 0xD1;
const HEADSET_DISCONNECTED = 0xD2;
const REQUEST_DENIED = 0xD3;
const STANDBY_SCAN = 0xD4;

export default class Listener extends EventEmitter
{
    protected data:Buffer = Buffer.from([]);
    protected headset: Headset;

    constructor(dongle:SerialPort, headset: Headset)
    {
        super();
        EventEmitter.call(this);
        dongle.on('data', (data) => {
            this.data = Buffer.concat([this.data, data]);
            this.listen();
        })
        this.headset = headset;
    }

    protected listen(): void
    {
        // Check [SYNC] bytes
        if (!this.read(1).equals(SYNC_BYTE)) {
            return;
        }
        if (!this.read(1).equals(SYNC_BYTE)) {
            return;
        }

        // Get [PLENGTH] byte
        let pLength:Buffer;
        while (true) {
            pLength = this.read(1);

            if (!pLength.equals(SYNC_BYTE)) {
                break;
            }
        }
        if (pLength[0] >= 169) {
            return;
        }

        // Collect [PAYLOAD...] bytes
        let payload:Buffer = this.read(pLength[0]);

        // Calculate [PAYLOAD...] checksum
        let calculatedChecksum:number = 0;
        for (let i = 0; i < pLength[0]; i++) {
            calculatedChecksum += payload[i]; // Sum up all the bytes in the payload
        }
        calculatedChecksum &= 0xFF; // Get the 8 lower bits from the sum
        calculatedChecksum = ~calculatedChecksum & 0xFF; // Get the inverse of those 8 bits

        // Verify [CHECKSUM] against calculated [PAYLOAD...] checksum
        let checksum:Buffer = this.read(1);
        if (checksum[0] != calculatedChecksum) {
            return;
        }

        // [CHECKSUM] is valid, parse [PAYLOAD...]
        this.parsePayload(payload);
    }

    protected parsePayload(payload:Buffer):void
    {
        let excode:number = 0;
        let code:number;
        let value;
        let vlength:number;

        while (payload.length) {
            
            [code, payload] = [payload[0], payload.slice(1)];
    
            while (code == EXCODE) {
                excode += 1;
    
                [code, payload] = [payload[0], payload.slice(1)];
            }
    
            if (code < 0x80) {
                [value, payload] = [payload[0], payload.slice(1)];
    
                switch (code) {
                    case POOR_SIGNAL:
                        this.emit('poorSignal', value);
                        break;
                    case ATTENTION:
                        this.emit('attention', value);
                        break;
                    case MEDITATION:
                        this.emit('meditation', value);
                        break;
                    case BLINK:
                        this.emit('blink', value);
                        break;
                    case BATTERY: 
                        this.emit('battery', value);
                        break;
                    default:
                        break;
                }
            } else {
                [vlength, payload] = [payload[0], payload.slice(1)];
                [value, payload] = [payload.slice(0, vlength), payload.slice(vlength)];                

                switch (code) {
                    case HEADSET_CONNECTED:
                        let id:string = value.toString('hex').toUpperCase();
                        this.emit('connected', id);
                        break;
                    case HEADSET_NOT_FOUND:
                        this.emit('notFound', value);
                        break;
                    case HEADSET_DISCONNECTED:
                        this.emit('disconnected', value);
                        break;
                    case STANDBY_SCAN: 
                        this.emit('scanning', value);
                        break;
                    case REQUEST_DENIED:
                        this.emit('requestDenied', value);
                        break;
                    case ASIC_EEG_POWER:
                        let waves: Waves = {
                            delta: value.readIntBE(0,3),
                            theta: value.readIntBE(3,3),
                            lowAlpha: value.readIntBE(6,3),
                            highAlpha: value.readIntBE(9,3),
                            lowBeta: value.readIntBE(12,3),
                            highBeta: value.readIntBE(15, 3),
                            lowGamma: value.readIntBE(18,3),
                            highGamma: value.readIntBE(21,3)
                        };

                        this.emit('asicEegPower', waves);
                        this.headset.waves = waves;
                        break;
                    case RAW_VALUE:
                        let raw:number = value[0] * 256 + value[1];
                        if (raw >= 32768) {
                            raw = raw - 65536;
                        }

                        this.emit('rawValue', raw);
                        this.headset.raw = raw;
                        break;
                    default:
                        break;
                }
            }
        }

    }

    protected read(length:number = 1) {
        let byte = this.data.slice(0, length);
        this.data = this.data.slice(length, this.data.length);
        return byte;
    }
}