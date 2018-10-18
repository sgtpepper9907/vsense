import Headset from '../Headset/Headset';
import { MongoClient } from 'mongodb';
import { EventEmitter } from 'events';

export class Trainer {
    
    protected headset: Headset;
    public collection;
    protected emitter: EventEmitter;
    protected data = [];

    constructor(headset: Headset) {
        this.headset = headset;
        let client = new MongoClient('mongodb://127.0.0.1:27017');
        this.emitter = new EventEmitter();
        client.connect(err => {
            if (err) return;
            this.emitter.emit('connected');
            this.collection = client.db('vsense').collection('train');
        });
    }

    public train(output: string, action: Promise<any>) {

        let interval = setInterval(() => {
            if (this.headset.waves &&
                !this.headset.waves.lowGamma &&
                !this.headset.waves.highGamma) return;
            this.data.push({
                input: {
                    raw: this.headset.raw,
                    lowGamma: this.headset.waves.lowGamma,
                    highGamma: this.headset.waves.highGamma
                }, output: { [output]: 1}
            })
        }, 500);

        action.then(() => {
            clearInterval(interval);
            let data = this.data.slice(0);
            this.data = [];
            console.log(data);
            console.log('done ' + output);
            if (data.length) {
                this.collection.insertMany(data)
                    .catch((error) => {
                        console.log(error);
                    });
            }
        })

        return action;

    }

    public getData() {
        let cursor = this.collection.find();
        let data = [];
        return new Promise((resolve) => {
            cursor.forEach(({input, output}) => {
                data.push({input, output});
            }).then(() => {
                resolve(data);
            })
        })
    }

    public on(event:string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.emitter.on(event, resolve);
        })
    }

}