import { S3 } from 'aws-sdk'
import axios from 'axios';
import { Station } from './station-model';
import { env } from 'process';
import {json2csvAsync} from 'json-2-csv';

const s3 = new S3();

module.exports.run = async (event, context) => {
	const data = await axios.get(process.env.NEXTBIKE_URL!, {});

	if(data.data.countries && data.data.countries[0] && data.data.countries[0].cities[0]) {
		const locations = data.data.countries[0].cities[0].places;

        const stations: Station[] = [];
        locations.forEach(station => {
            stations.push({
                station_id: station.number,
                station_lat: station.lat,
                station_lng: station.lng,
                station_name: station.name,
                station_type: station.terminal_type,
                num_racks: station.bike_racks
            });
        });

        const csv = await json2csvAsync(stations, {});

		const result = await s3.putObject({
			Bucket: process.env.S3_BUCKET_URI!,
			Key: `${env.FOLDER}/${new Date().toISOString()}.csv`,
			Body: csv
		}).promise();
		console.log(result);
	}
};