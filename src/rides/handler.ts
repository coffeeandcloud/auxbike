import {S3} from 'aws-sdk'
import axios from 'axios';
import { BikeStatus, StationStatus } from './ride-model';
import {json2csvAsync} from 'json-2-csv';

const s3 = new S3();
module.exports.run = async (event, context) => {
	const timestamp = new Date();
	const data = await axios.get(process.env.NEXTBIKE_URL!, {});

	if(data.data.countries && data.data.countries[0] && data.data.countries[0].cities[0]) {
		const stations = data.data.countries[0].cities[0].places;

		const bikeStates: BikeStatus[] = [];
		const stationStates: StationStatus[] = [];

		stations.forEach(station => {
			// Extract bike status
			station.bike_list.forEach(bike => {
				bikeStates.push({
					station_id: station.number,
					bike_id: bike.number,
					active: bike.active,
					maintenance: bike.state,
					bike_type: bike.bike_type,
					board_computer_id: bike.boardcomputer,
					timestamp: Math.floor(timestamp.getTime()/1000)
				});
			});
			// Extract station status
			stationStates.push({
				timestamp: Math.floor(timestamp.getTime()/1000),
				station_id: station.number,
				bike_count: station.bikes,
				rentable_bike_count: station.bikes_available_to_rent
			});
		});

		// Convert to CSV
		const bikeStatesCsv = await json2csvAsync(bikeStates);
		const stationStatesCsv = await json2csvAsync(stationStates);

		const bikeStatesPutResult = await s3.putObject({
			Bucket: process.env.S3_BUCKET_URI!,
			Key: `${process.env.BIKE_STATE_FOLDER!}/${timestamp.toISOString()}.csv`,
			Body: bikeStatesCsv
		}).promise();
		console.log(bikeStatesPutResult);

		const stationStatesPutResult = await s3.putObject({
			Bucket: process.env.S3_BUCKET_URI!,
			Key: `${process.env.STATION_STATE_FOLDER!}/${timestamp.toISOString()}.csv`,
			Body: stationStatesCsv
		}).promise();
		console.log(stationStatesPutResult);
	}
};
