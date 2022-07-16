import {TotalData} from "./data";

const star6probability = 0.02;
const star6probabilityIncreaseStep = 50;
const star6probabilityIncreaseMultiple = 2;
const star5probability = 0.05;

class DrawCardSet {
  constructor(records, aim, current = false) {
    this.records = records;
    this.aim = aim;
    this.current = current;
  }
}

/**
 *
 * @param {TotalData} totalPool
 * @param {number} star
 */
function buildSet(totalPool, star = 6) {
  totalPool.sortUp();
  let sets = [];
  let temp = [];
  totalPool.records.forEach(record => {
    if (record.star === star) {
      if (temp.length > 0) {
        temp.push(record);
        sets.push(new DrawCardSet(temp, record));
      }
      temp = [];
    } else
      temp.push(record);
  });
  if (temp.length > 0) {
    sets.push(new DrawCardSet(temp, null, true));
  }
  return sets;
}

function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

function binomialDistribution(p, n, k) {
  return (factorial(n) / (factorial(k) * factorial(n - k))) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function generateStar6DistributionTable(max = 100, customProbability = null) {
  let probability = customProbability !== null ? customProbability : star6probability;
  let table = [];
  for (let n = 1; n <= max; n++) {
    table.push(binomialDistribution(probability, n, 1));
    if (n % star6probabilityIncreaseStep === 0) {
      probability *= star6probabilityIncreaseMultiple;
    }
  }
  return table;
}

function generateSpecifyStar6DistributionTable(specifyProbability, max = 100, customProbability = null) {
  let probability = customProbability !== null ? customProbability : star6probability;
  return generateStar6DistributionTable(max, probability * specifyProbability);
}

function getExpectedRemainToGetStar6(max = 300, customProbability = null) {
  let subProbability = customProbability !== null ? customProbability : 1;

  return ((0.0002931638400649029 * subProbability) ** -0.5042894078962703) - 19.357665781564496
}

function getSpecifyExpectedRemainToGetStar6(specifyProbability, max = 300, customProbability = null) {
  let probability = customProbability !== null ? customProbability : star6probability;
  return getExpectedRemainToGetStar6(max, probability * specifyProbability);
}

function generateStar5DistributionTable(max = 100) {
  let table = [];
  for (let n = 1; n <= max; n++)
    table.push(binomialDistribution(star5probability, n, 1));
  return table;
}

function getExpectedRemainToGetStar5(max = 300, customProbability = null) {
  let e = null;
  let probability = customProbability !== null ? customProbability : star5probability;
  for (let n = 1; n <= max; n++) {
    let result = n * probability;
    if (result >= 1) {
      e = n;
      break;
    }
  }
  return e;
}


export {
  DrawCardSet,
  buildSet,
  generateStar6DistributionTable,
  generateSpecifyStar6DistributionTable,
  generateStar5DistributionTable,
  getExpectedRemainToGetStar6,
  getExpectedRemainToGetStar5,
  getSpecifyExpectedRemainToGetStar6
};
