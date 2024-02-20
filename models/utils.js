exports.fixTimestamp = (date) => {
    // For some reason, Postgres seems to be returning the date with a
    // timezone I didn't ask for, so I need to account for the discrepency.
    // The worst part is, not every date is affected by this.
    const offsetMilliseconds = date.getTimezoneOffset() * 60 * 1000;
    const correctTimestamp = Date.parse(date) - offsetMilliseconds;
    return new Date(correctTimestamp);
};
