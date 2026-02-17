<img src="/assets/icons/postmark.svg" alt="Postmark logo" width="300px">

# Postmark Workers
Inegration with Postmark SMTP relay. Could probably be easily modified to work with other SMTP relay providers or self hosted email server.
## Todo
- [x] Replace token with secret
- [ ] adjust to also handle bounce list, for better security (currently is direct homepage API call)
- [x] Finish readme
- [ ] Move homepage to seperate yaml file (to shorten readme if other dashboards, website docs are neded)
## Postmark API/Credentials

# Sent and Bounced Metrics
This worker is for querying and manipulating API calls between Postmark and Homepage (or could quite easily be adjusted to work with a different UI frontend and/or a different SMTP relay provider), to show for a given email domain some basic data (number of emails sent, bounced and reported as spam) in the previous 24 hours and also show a list of the email address and reason for bounce of customers for various services (e.g ecommerce customers, automatically generated emails sent by our website) This so we have easy visibility and decide wether to take action or not without needing to login to Postmark's web admin portal.
## Deployment
1. Create Cloudflare secret in Secret Store
2. Create the Cloudflare worker
3. Bind Secrets Store value, using the variable name `POSTMARK_API`
4. Set a cron schedule (every 12 hours)
> [!NOTE]
> See `README.md` at the root of this repo for instructions on these parts of the deployment
5. Add your Pool and Tenant ID's to `sentBounced.js`
## Homepage integration
1. Copy the [Postmark icon](../assets/icons/postmark.svg) into your `homepage/config/icons` directory
2. Open `homepage/config/services.yaml` copy in the below to the appropriate services group, changing any `<variables>`
3. Copy in [`homepage.yaml`](/dashboards/homepaghe.yaml)