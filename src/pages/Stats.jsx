import { useState, useEffect } from "react";
import ApiService from "../utils/ApiService";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, Col, Select } from "antd";

const { RangePicker } = DatePicker;

const Stats = () => {
  const [trackBookings, setTrackBookings] = useState([]);
  const [pickerType, setPickerType] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    const fetchTrackBookings = async () => {
      let bookings;
      const tracks = await ApiService.getAllTracks();

      if (!pickerType || pickerType === "") {
        bookings = await Promise.all(
          tracks.map(async (track) => {
            const bookingCount = await ApiService.getBookingCountByTrackId(
              track.id
            );
            return {
              name: track.name,
              bookings: bookingCount,
              price: track.price,
            };
          })
        );
      } else if (dateRange[0] && dateRange[1]) {
        bookings = await Promise.all(
          tracks.map(async (track) => {
            const bookingCount =
              await ApiService.getBookingCountByTrackIdAndDateBetween(
                track.id,
                dateRange[0].format("YYYY-MM-DD"),
                dateRange[1].format("YYYY-MM-DD")
              );
            return {
              name: track.name,
              bookings: bookingCount,
              price: track.price,
            };
          })
        );
      }
      setTrackBookings(bookings);
    };
    fetchTrackBookings();
  }, [pickerType, dateRange]);

  const handlePickerTypeChange = (type, value) => {
    setPickerType(value);
    if (value === "") {
      setDateRange([null, null]);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <div>
      <h1>Stats</h1>
      <h2>Tracks and Bookings</h2>
      <Col>
        <Select
          style={{ width: 120 }}
          placeholder="Filter by"
          value={pickerType}
          onChange={(value) => handlePickerTypeChange("type", value)}
        >
          <Option value="">None</Option>
          <Option value="day">Day</Option>
          <Option value="week">Week</Option>
          <Option value="month">Month</Option>
          <Option value="quarter">Quater</Option>
          <Option value="year">Year</Option>
        </Select>
      </Col>
      <RangePicker
        onChange={handleDateRangeChange}
        picker={pickerType}
        disabled={!pickerType || pickerType === ""}
      />

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={trackBookings}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="bookings" fill="#8884d8" />
          <Bar dataKey="price" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Stats;
