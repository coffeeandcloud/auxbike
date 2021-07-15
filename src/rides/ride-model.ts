export interface BikeStatus {
    timestamp: number;
    station_id: number;
    bike_id: number;
    maintenance: string;
    active: boolean;
    board_computer_id: number;
    bike_type: number;
}

export interface StationStatus {
    timestamp: number;
    station_id: number;
    bike_count: number;
    rentable_bike_count: number;
}