import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

// Function to fetch GraphQL results from an API
async function fetchQuery(operation: any, variables: any) {
  const response = await fetch('http://your-graphql-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });
  return await response.json();
}

// Create Relay environment
const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
