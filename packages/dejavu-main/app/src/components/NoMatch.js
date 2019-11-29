import React from 'react';
import { Icon, Button } from 'antd';
import { Link } from 'react-router-dom';

const NoMatch = () => (
  <section
    css={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Icon
      type="frown"
      theme="outlined"
      style={{ fontSize: 44, marginBottom: 20 }}
    />
    <h2>Page not found</h2>
    <p>
      Sorry, we couldn
      {"'"}t find what you are looking for
    </p>
    <Link to="/">
      <Button type="primary" size="large">
        Go Back
      </Button>
    </Link>
  </section>
);

export default NoMatch;
