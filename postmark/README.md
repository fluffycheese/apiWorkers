<img src="/stephenjackson/cf-workers/media/branch/main/assets/icons/postmark.svg" alt="Postmark logo" width="300px">

# Postmark Workers
Inegration with Postmark SMTP relay. Could probably be easily modified to work with other SMTP relay providers or self hosted email server.
## Todo
- [x] Replace token with secret
- [ ] adjust to also handle bounce list, for better security (currently is direct homepage API call)
- [x] Finish readme
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
```yaml
    - Postmark:
        href: <URL of your Postmark dashboard>
        icon: /icons/postmark.svg
        description: 📬 Yesterdays outbound emails
        widget:
            type: customapi
            url: <URL of your Cloudflare worker>
            refreshInterval: 10800000 # 10800000 = 3hr # optional - in milliseconds, defaults to 10s (10000)
            mappings:
                - field: Sent
                  label: Sent
                  format: number
                - field: Bounced
                  label: Bounced
                  format: number
                - field: SpamComplaints
                  label: Spam
                  format: number
    - Bounces:
        href: <URL of your Postmark dashboard>
        icon: /icons/postmark.svg
        description: 📬 Last 5 Bounces
        widget:
            type: customapi
            url: https://api.postmarkapp.com/bounces?type=HardBounce&inactive=true&count=50&offset=0
            headers:
                Accept: application/json
                X-Postmark-Server-Token: <Your server token>
            display: dynamic-list
            mappings:
                items: Bounces # optional, the path to the array in the API response. Omit this option if the array is at the root level
                name: Email # required, field in each item to use as the item name (left side)
                label: Description # required, field in each item to use as the item label (right side)
                limit: 5 # optional, limit the number of items to display
                target: https://account.postmarkapp.com/servers/<YOUR_SERVER>/streams/outbound/messages/{MessageID}
```