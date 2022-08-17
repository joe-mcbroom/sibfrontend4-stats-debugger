# sibfrontend4-stats-debugger

## Install Docker

https://docs.docker.com/get-docker/

## Clone Repository
clone repo and `cd sibfrontend4-stats-debugger`

## Build and Run Docker container

```bash
/* Build docker image (only needs to be done once) */
docker build -t stats-debugger .

/* Run docker container (every time you want to run the container) */
docker run -d -p 3001:3001 stats-debugger
```

## How to Kill Docker container

```bash
docker ps -q --filter ancestor=stats-debugger | xargs docker rm --force 
```

## Modify apache config to redirect /stats2 requests to localhost:3001

Locate the apache vhosts config file:

* Windows: C:\XAMPP\apache\conf\extra\httpd-vhosts.conf
* Mac: /etc/apache2/extra/httpd-vhosts.conf

Remove or comment the following lines
```bash
    ProxyPass /stats2/ http://ca4-qa.global.nba.com/stats2/
    ProxyPassReverse /stats2/ http://ca4-qa.global.nba.com/stats2/
    ProxyPass /stats2/ http://ca4-qa.global.nba.com/stats2/
    ProxyPassReverse /stats2/ http://ca4-qa.global.nba.com/stats2/
```
And add this
```bash
    ProxyPass /stats2/ http://localhost:3001/stats2/
    ProxyPassReverse /stats2/ http://localhost:3001/stats2/
```

### Restart apache
* Windows: C:\XAMPP\apache\bin\httpd.exe -k restart
* Mac: sudo /usr/sbin/apachectl restart


Open browser and navigate to http://localhost:3001/json-editor

Now you can make refresh your running local SIB application. ie. http://ca4-dev.global.nba.com/scores/

If you inspect the network traffic, you'll see any `/stats2` requests are pending

Refresh the browser at http://localhost:3001/json-editor

Make any changes to the json response and click the "Save" button

The json response will resolve in the frontend application

If there are more pending requests, they should automatically display in the json-editor, if not just refresh.

You can use "Clear Requests" to clear the pending requests in the json-editor.

Enjoy!

If you want to disable the debugger without modifying the apache config, you can start the docker container with the following command:

```bash
docker run -p 3001:3001 -d stats-debugger true
```
