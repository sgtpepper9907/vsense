import Headset from '../Headset/Headset';
import { MongoClient } from 'mongodb';
import { EventEmitter } from 'events';

class Trainer {
    
    protected headset: Headset;
    public collection: MongoClient.databse.collection;
    protected emitter: EventEmitter;

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
            this.collection.insert({
                input: {
                    raw: this.headset.raw,
                    ...this.headset.waves
                }, output
            })
        }, 50);

        action.then(() => clearInterval(interval))
    }

    public on(event:string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.emitter.on(event, resolve);
        })
    }

}