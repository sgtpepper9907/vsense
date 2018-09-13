import  HeadsetConfig  from "../Interfaces/HeadsetConfig";
import * as SerialPort from "serialport";
import  Listener  from "./Listener";
import * as _ from "lodash";

const CONNECT = [0xC0];
const DISCONNECT = [0xC1];
const AUTO_CONNECT = [0xC2];

export default class Headset 
{

    protected _listener:Listener;
    protected baudRate:number;
    protected port:string;
    protected dongle:SerialPort;
    protected connected = false;

    public constructor(options:HeadsetConfig = {}) 
    {
        this.port = options.port || '/dev/ttyUSB0';
        this.baudRate = options.baudRate || 115200;
        this.openSerialPort();
        this._listener = new Listener(this.dongle);
    }

    public connect(headestID:Array<number> = []) 
    {
        this.disconnect();

        setTimeout(() => {
            if (headestID.length > 0) {
                this.dongle.write(Buffer.from(CONNECT.concat(headestID)));
            } else {
                this.dongle.write(Buffer.from(AUTO_CONNECT));
            }
        }, 50);
    }
    
    public disconnect() 
    {
        this.dongle.write(Buffer.from(DISCONNECT));    
    }

    
    public get listener() : Listener 
    {
        if (_.isEmpty(this._listener)) {
            return new Listener(this.dongle);
        }

        return this._listener;
    }

    protected openSerialPort(): void
    {
        this.dongle = new SerialPort(this.port, {
            baudRate: this.baudRate
        });
    }
}