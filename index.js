/* The maximum number of minutes in a period (a day) */

const MAX_IN_PERIOD = 1440;

/**
 * PART 1
 *
 * You have an appliance that uses energy, and you want to calculate how
 * much energy it uses over a period of time.
 *
 * As an input to your calculations, you have a series of events that contain
 * a timestamp and the new state (on or off). You are also given the initial
 * state of the appliance. From this information, you will need to calculate
 * the energy use of the appliance i.e. the amount of time it is switched on.
 *
 * The amount of energy it uses is measured in 1-minute intervals over the
 * period of a day. Given there is 1440 minutes in a day (24 * 60), if the
 * appliance was switched on the entire time, its energy usage would be 1440.
 * To simplify calculations, timestamps range from 0 (beginning of the day)
 * to 1439 (last minute of the day).
 *
 * HINT: there is an additional complication with the last two tests that
 * introduce spurious state change events (duplicates at different time periods).
 * Focus on getting these tests working after satisfying the first tests.
 *
 * The structure for `profile` looks like this (as an example):
 * ```
 * {
 *    initial: 'on',
 *    events: [
 *      { state: 'off', timestamp: 50 },
 *      { state: 'on', timestamp: 304 },
 *      { state: 'off', timestamp: 600 },
 *    ]
 * }
 * ```
 */

const getNextState = (state) => {
  if (state === 'on') {
    return 'off';
  } else if (state === 'off') {
    return 'on';
  } else {
    throw 'state must be "on" or "off"';
  }
};

const calculateEnergyUsageSimple = (profile) => {
  if (profile.events?.length === 0) {
    if (profile.initial === 'on') {
      return MAX_IN_PERIOD;
    } else {
      return 0;
    }
  }

  profile.events.sort((a, b) => a.timestamp - b.timestamp);

  let prevState = profile.initial;
  let prevStateTime = 0;
  let totalTime = 0;

  for (let i = 0; i < profile.events.length; i++) {
    const newState = getNextState(prevState);
    if (profile.events[i].state === newState) {
      if (newState === 'off') {
        totalTime += profile.events[i].timestamp - prevStateTime;
      }
      prevState = newState;
      prevStateTime = profile.events[i].timestamp;
    }
    if (
      profile.events[i].state === 'on' &&
      i === profile.events.length - 1
    ) {
      totalTime += MAX_IN_PERIOD - prevStateTime;
    }
  }
  return totalTime;
};

/**
 * PART 2
 *
 * You purchase an energy-saving device for your appliance in order
 * to cut back on its energy usage. The device is smart enough to shut
 * off the appliance after it detects some period of disuse, but you
 * can still switch on or off the appliance as needed.
 *
 * You are keen to find out if your shiny new device was a worthwhile
 * purchase. Its success is measured by calculating the amount of
 * energy *saved* by device.
 *
 * To assist you, you now have a new event type that indicates
 * when the appliance was switched off by the device (as opposed to switched
 * off manually). Your new states are:
 * * 'on'
 * * 'off' (manual switch off)
 * * 'auto-off' (device automatic switch off)
 *
 * (The `profile` structure is the same, except for the new possible
 * value for `initial` and `state`.)
 *
 * Write a function that calculates the *energy savings* due to the
 * periods of time when the device switched off your appliance. You
 * should not include energy saved due to manual switch offs.
 *
 * You will need to account for redundant/non-sensical events e.g.
 * an off event after an auto-off event, which should still count as
 * an energy savings because the original trigger was the device
 * and not manual intervention.
 */

const calculateEnergySavings = (profile) => {};

/**
 * PART 3
 *
 * The process of producing metrics usually requires handling multiple days of data. The
 * examples so far have produced a calculation assuming the day starts at '0' for a single day.
 *
 * In this exercise, the timestamp field contains the number of minutes since a
 * arbitrary point in time (the "Epoch"). To simplify calculations, assume:
 *  - the Epoch starts at the beginning of the month (i.e. midnight on day 1 is timestamp 0)
 *  - our calendar simply has uniform length 'days' - the first day is '1' and the last day is '365'
 *  - the usage profile data will not extend more than one month
 *
 * Your function should calculate the energy usage over a particular day, given that
 * day's number. It will have access to the usage profile over the month.
 *
 * It should also throw an error if the day value is invalid i.e. if it is out of range
 * or not an integer. Specific error messages are expected - see the tests for details.
 *
 * (The `profile` structure is the same as part 1, but remember that timestamps now extend
 * over multiple days)
 *
 * HINT: You are encouraged to re-use `calculateEnergyUsageSimple` from PART 1 by
 * constructing a usage profile for that day by slicing up and rewriting up the usage profile you have
 * been given for the month.
 */

const isInteger = (number) => Number.isInteger(number);

const calculateEnergyUsageForDay = (monthUsageProfile, day) => {
  if (!isInteger(day)) {
    throw 'must be an integer';
  }
  if (day < 1 || day > 365) {
    throw 'day out of range';
  }

  const initialTimestamp = (day - 1) * MAX_IN_PERIOD;
  const firstIndex = monthUsageProfile.events.findIndex(
    (event) => event.timestamp >= initialTimestamp
  );
  const lastIndex = monthUsageProfile.events.findIndex(
    (event) => event.timestamp >= initialTimestamp + MAX_IN_PERIOD
  );

  let slicedEvents = monthUsageProfile.events.slice(firstIndex, lastIndex);
  let initialState = monthUsageProfile.events[firstIndex - 1]?.state;
  
  if (firstIndex >= 0 && lastIndex >= 0) {
    if (firstIndex === 0) {
      initialState = monthUsageProfile.initial;
    }
  } else if (firstIndex >= 0 && lastIndex < 0) {
    slicedEvents = monthUsageProfile.events.slice(firstIndex);
    if (firstIndex === 0) {
      if (slicedEvents.length === 1) {
        initialState = monthUsageProfile.initial;
      } else {
        initialState = monthUsageProfile.events[0].state;
      }
    }
  } else if (firstIndex < 0 && lastIndex >= 0) {
    initialState = monthUsageProfile.initial;
  } else if (firstIndex < 0 && lastIndex < 0) {
    slicedEvents = [];
    if (monthUsageProfile.events.length === 0) {
      initialState = monthUsageProfile.initial;
    } else {
      initialState =
        monthUsageProfile.events[monthUsageProfile.events.length - 1].state;
    }
  }

  const dayUsageProfile = {
    initial: initialState,
    events: slicedEvents.map((event) => ({
      ...event,
      timestamp: event.timestamp - initialTimestamp,
    })),
  };
  return calculateEnergyUsageSimple(dayUsageProfile);
};

module.exports = {
  calculateEnergyUsageSimple,
  calculateEnergySavings,
  calculateEnergyUsageForDay,
  MAX_IN_PERIOD,
};
