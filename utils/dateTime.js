/**
 * Get the date in the format of YYYY-MM-DD
 * @param {Date} date
 * @returns {String} date in the format of YYYY-MM-DD
 */
function getCalendarDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

export { getCalendarDate };
