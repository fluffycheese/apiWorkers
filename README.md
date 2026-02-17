<img src="/assets/icons/cloudflare.png" alt="Cloudflare logo" width="300px">

# Cloudflare Workers
A collection of Cloudflare workers. Mostly for dynamic API request and manipulation for use with [Homepage](https://github.com/gethomepage/homepage). This is for added security as Homepage stores API tokens in plaintext in the `services.yaml` file and for better functionality as Homepage is unable to more complex, dynamic queries/manipulation. Don't get me wrong, Homepage is a **great** app and I have several instances deployed in production, I just needed to create these to get around some it's limitations.
## Todo
- [ ] Add firewall rule blocks all other traffic globally and Worker IP check to prevent accidental bypass (e.g., via custom routing)
- [x] Fix logo size for readme headings
- [x] Rebuild all deployed Homepage API calls with CF workers for added security
- [ ] Learn `wrangler` so can fully automate deployment with the Cloudflare API and scripting
- [ ] Develop "dual-stack" deployment methodoligy with custom docker images for each worker
## Development
### Local Development
Packages to install
1. JDK (Java Development Kit)
2. JQ (Command line JSON processor)
3. Node.js (Evented I/O for V8 javascript)

VScode/codium extensions
1. Oracle Java [marketplace](https://marketplace.visualstudio.com/items?itemName=Oracle.oracle-java) [repo](https://github.com/oracle/javavscode)
2. HTML CSS suport [marketplace](https://marketplace.visualstudio.com/items?itemName=ecmel.vscode-html-css) [repo](https://github.com/ecmel/vscode-html-css)
## Deployment
### Configuring Workers in Cloudflare
#### Worker Creation
1. Login to [Cloudflare](https://dash.cloudflare.com)
2. On the left side menu, go to `Build` > `Compute & AI` > `Workers & Pages`
3. Click on `Create Application`
4. Click `Start with Hello World!`
5. Give your worker a name, then `Deploy`
6. Once deployed, in the top right, click `</> Edit Code`
7. Delete the hello world code and replace with one of the `.js` worker files in this repo, carefully following its `README.md`
> [!TIP]
> Test the worker by hitting the refresh icon to the right of the worker URL. It should successfully output the Json query. E.g the Ruckus `expiringDpsk.js` should look something like:
> ```json
> {
>  "totalPassphrases": 118,
>  "expiringIn14Days": 2,
>  "expiringList": [
>    {
>      "id": "ebef409db8354e31addc0c6f2129c922",
>      "username": "fluffycheese short dpsk test",
>      "passphrase": "FZRPRwF5Utu7kY2RThy",
>      "expirationDate": "2025-12-01T00:00:00Z"
>    },
>    {
>      "id": "fdd044299d7847f29ded3e986500e8x1",
>      "username": "John Smith (staff)",
>      "passphrase": "ns75EF3Kn2G3pCEfRE",
>      "expirationDate": "2025-12-12T11:15:59Z"
>    }
>  ]
> }
> ```
8. Click `Deploy` at the top right
> [!NOTE]
> In the overview tab, take note of the worker URL. As you will need this later when integrating with Homepage (or another application)
> ![image of worker URL](/assets/img/Screenshot_20251129_123352.png)
#### Secrets Store
##### Creating Secrets
1. Navigate to `Build` > `Storage & databases` > `Secrets Store`
2. Click `Create Secret`
3. Fill in the `Secret name` with the secret name as described in the worker files in this repo, carefully following its `README.md`
4. Ensure `Permission scope` is set to `Workers`
5. Add the `Value` with the secret value as described in the worker files in this repo, carefully following its `README.md`
6. **Optionally** Add a coment to better describe what the secret is/is for
##### Binding Secrets to Workers
1. On the left side menu, go to `Build` > `Compute & AI` > `Workers & Pages`
2. Click on the approriate worker
3. At the top left of the page, click the `Bindings` tab
4. `Add binding`
5. On the left side list of this pop-up, select `Secrets Store`
6. `Add binding`
7. Click on `Secret name`, select the required, previously created secret
8. Fill in `Variable name` with the exact same as `Secret name`
9. Repeat as required for each secret
> [!TIP]
> Your secret should now show on the `Bindings page`
> ![Image of successful bindings tab](/assets/img/Screenshot_20251129_115952.png)
##### Scheduling
1. On the left side menu, go to `Build` > `Compute & AI` > `Workers & Pages`
2. Click on the approriate worker
3. At the top left of the page, click the `Settings` tab
4. Navigate to `Trigger Events`
5. Click `+ Add`
6. Select `Cron Triggers`
7. Change the schedule to your liking
8. Click `Add`
## Integration with Homepage
[Homepage](https://github.com/gethomepage/homepage) is a modern, fully static, fast, secure fully proxied, highly customizable application dashboard with integrations for over 100 services and translations into multiple languages. Easily configured via YAML files or through docker label discovery.

The instructions for worker integration is in each of the worker files `README.md`