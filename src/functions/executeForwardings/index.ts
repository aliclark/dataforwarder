const timeoutMins = 1;

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}/handler.main`,
  timeout: timeoutMins * 60,
  events: [
    {
      schedule: {
        rate: `rate(${timeoutMins} minute${timeoutMins !== 1 ? 's' : ''})`
      }
    }
  ]
}
