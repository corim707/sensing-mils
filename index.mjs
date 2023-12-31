import axios from 'axios'      // Used to make HTTP Requests
import moment from 'moment'   // Used for time
import {appendFileSync} from 'fs';

const FILE_NAME_TO_OUTPUT = `sensing-mills-sensors.csv`
const API_KEY = ``;
const SENSOR_IDS = [
    'sensor1'
]

const FIELDS = [
    `humidity`, `humidity_a`, `humidity_b`, `temperature`, `temperature_a`, `temperature_b`, `pressure`, `pressure_a`, `pressure_b`
]

/**
 * Configure the Axios request library (https://www.npmjs.com/package/axios#interceptors) to
 * use a defined API key.  Adds this to every request sent by Axios
 * 
 * @param {String} apiKey 
 */
const setupAxios = (apiKey) => {
    axios.interceptors.request.use((request) => {
        request.headers.set('X-API-Key', apiKey);
        return request;
      }, null, { synchronous: true });
}


/**
 * Requests the sensor history for a given sensor id.  StartTime and EndTime are Optional.
 * 
 * @param {
 * sensorId: String, 
 * startTime: Date,
 * endTime: Date
 * } sensorRequest
 */
const getSensorData = async ({sensorId, startTime, endTime})=>{
    const requestUrl = `https://api.purpleair.com/v1/sensors/${sensorId}/history/csv`;
    const params = { fields: FIELDS.join(',')};
    if (startTime) params[`start_timestamp`] = startTime;
    if (endTime) params[`end_timestamp`] = endTime.format('x');
    return axios.get(requestUrl, params);
}

setupAxios( API_KEY );

const endTime = moment().subtract(1, 'day');

let sensorDataCollection = [];

for (const sensorId in SENSOR_IDS){
    const sensorData = await getSensorData( {sensorId, endTime});
    sensorDataCollection.push( sensorData.data );
}

const fullCsv = sensorDataCollection.join(`\n`); // Take the CSV data from each sensor and concatenate it into a single file

try {
    appendFileSync(`./${FILE_NAME_TO_OUTPUT}`, fullCsv); // Append all of the data to the filename and 
} catch (error) {
    console.log(error);
}






