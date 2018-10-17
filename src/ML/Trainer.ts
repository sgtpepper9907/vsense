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

    public train(output: string, action: Function) {

        let interval = setInterval(() => {
            this.data.push({
                input: {
                    raw: this.headset.raw,
                    ...this.headset.waves
                }, output
            })
        }, 50);

        action();

        if (this.data.length) {
            this.collection.insertMany(this.data).then(() => {
                clearInterval(interval);
            }).catch((error) => {
                console.log(error);
            });
        }

        this.data = [];

    }

    public on(event:string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.emitter.on(event, resolve);
        })
    }

}