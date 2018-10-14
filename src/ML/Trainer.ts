import Headset from '../Headset/Headset';
import { MongoClient } from 'mongodb';

class Trainer {
    
    protected headset: Headset;
    public collection: MongoClient.databse.collection;

    constructor(headset: Headset) {
        this.headset = headset;
        let client = new MongoClient('mongodb://127.0.0.1:27017');
        client.connect(err => {
            if (err) return;
            this.collection = client.db('vsense').collection('train');
        })
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

}