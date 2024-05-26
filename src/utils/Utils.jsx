import football_outdoor from "../assets/Football_outdoor.jpg";
import football_indoor from "../assets/Football_indoor.jpg";
import basket_outdoor from "../assets/Basket_outdoor.jpg";
import basket_indoor from "../assets/Basket_indoor.jpg";
import padel_outdoor from "../assets/Padel_outdoor.webp";
import padel_indoor from "../assets/Padel_indoor.jpg";
import tennis_outdoor from "../assets/Tennis_outdoor.webp";
import tennis_indoor from "../assets/Tennis_indoor.jpg";
import { Tag } from 'antd';

export const srcTrackImage = (sport, type) => {
  switch (sport) {
    case 'Football':
      switch (type) {
        case 'outdoor':
          return football_outdoor;
        case 'indoor':
          return football_indoor;
        default:
          return null;
      }
    case 'Basket':
      switch (type) {
        case 'outdoor':
          return basket_outdoor;
        case 'indoor':
          return basket_indoor;
        default:
          return null;
      }
    case 'Padel':
      switch (type) {
        case 'outdoor':
          return padel_outdoor;
        case 'indoor':
          return padel_indoor;
        default:
          return null;
      }
    case 'Tennis':
      switch (type) {
        case 'outdoor':
          return tennis_outdoor;
        case 'indoor':
          return tennis_indoor;
        default:
          return null;
      }
    default:
      return null;
  }
};

export const renderTagForSport = (sport) => {
      let color;
      if(sport === 'Basket'){
        color = 'orange';
      }
      else if(sport === 'Football'){
            color = 'green'
      }
      else if(sport === 'Padel'){
            color = 'blue'
      }
      else if (sport === 'Tennis'){
        color = 'gold'
      }
      return(
        <Tag color = {color} key={sport} style={{ minWidth: '70px', textAlign: 'center' }}>
          {sport.toUpperCase()}
        </Tag>
        )
}

export const renderTagForType = (type) => {
  let color;
  color = type === 'outdoor' ? 'cyan' : 'purple';
  return(
      <Tag color= {color}>
        {type.toUpperCase()}
      </Tag>
  )
}