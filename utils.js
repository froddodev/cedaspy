import axios from 'axios';
import puppeteer from 'puppeteer';

// Validate Steam ID
const isSteamId = (value) => {
  return /^\d{17}$/.test(value); 
};

// Function to get player information from Cedapug
export const getUsers = async (searchValue) => {
  try {
    let searchQuery = "&search%5Bvalue%5D=";

    if (isSteamId(searchValue)) {
      searchQuery += searchValue; // Steam ID
    } else {
      searchQuery += encodeURIComponent(searchValue); // Player name
    }

    // console.log("Searching Cedapug with query: ", searchQuery);  // Debugging

    const url = `https://cedapug.com/cedapug/php/get/ratings.php?draw=8&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=3&order%5B0%5D%5Bdir%5D=desc&start=0&length=10${searchQuery}&search%5Bregex%5D=false&_=1743674504591`;

    const response = await axios.get(url);
    const users = response.data.data;

    if (users.length > 0) {
      const user = users[0]; // Take the first user found
      // console.log("User found from Cedapug: ", user);  // Debugging
      const avatar = user[0].avatar;
      const steamId = user[2];
      const playerName = user[1].personaName;
      const mu = user[3].mu;
      const sigma = user[3].sigma;
      const lastPlayed = user[3].lastPlayed;

      const mmr = getRating(mu, sigma, lastPlayed);

      // Return an object with relevant player information
      return {
        playerName,
        steamId,
        avatar,
        mmr,
        lastPlayed
      };
    } else {
      return null; // Player not found
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Function to get player bans information
export const getBansInfo = async (steamId) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = `https://cedapug.com/bans?SteamId=${steamId}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    const bans = await page.evaluate(() => {
      const banElements = document.querySelectorAll('.ban-line');
      const banList = [];

      banElements.forEach((ban) => {
        const name = ban.querySelector('.ban-name div:nth-child(2)').textContent.trim();
        const steamId = ban.querySelector('.ban-steamid div:nth-child(2)').textContent.trim();
        const start = ban.querySelector('.ban-time div:nth-child(2)').textContent.trim();
        const end = ban.querySelector('.ban-time + .ban-time div:nth-child(2)').textContent.trim();
        const reason = ban.querySelector('.ban-reason div:nth-child(2)').textContent.trim();
        const bannedBy = ban.querySelector('.ban-steamid + .ban-steamid div:nth-child(2)').textContent.trim();

        banList.push({ name, steamId, start, end, reason, bannedBy });
      });

      return { bans: banList };
    });

    await browser.close();
    return bans;
  } catch (error) {
    console.error('Error fetching bans:', error);
    return { bans: [] };
  }
};

// Calculate MMR
function getRating(mu, sigma, lastPlayed = 0) {
  if (sigma < 3 && lastPlayed < 7) {
    return Math.round((mu - (3 * sigma)) * 100);
  } else {
    return "Not provided";
  }
}

// Function to get MMR range and assign colors
export function getMMRRange(mmr) {
  const mmrValue = parseInt(mmr);
  if (isNaN(mmrValue)) {
    return { label: 'No MMR', color: '#FFFFFF' };  // White (no MMR)
  }

  if (mmrValue < 0 || mmrValue <= 1208) {
    return { label: `Novice: ${mmrValue}`, color: '#00FF00' };  // Green
  } else if (mmrValue >= 1209 && mmrValue <= 1784) {
    return { label: `Intermediate: ${mmrValue}`, color: '#FFFF00' };  // Yellow
  } else if (mmrValue >= 1785) {
    return { label: `Expert: ${mmrValue}`, color: '#FF0000' };  // Red
  }
}
