require('./backend-common.cjs').setup(__dirname, Number(process.env.PORT||8787), require('./integrations.cjs'));
