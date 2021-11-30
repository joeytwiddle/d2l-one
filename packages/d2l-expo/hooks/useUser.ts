import React, { useState } from 'react';

type UserData = {
  name: string;
  sites: string[];
};

export default function useUser() {
  const [user, setUser] = useState<UserData | null>(null);

  React.useEffect(() => {
    // TODO: Fetch from back-end
    setTimeout(() => {
      setUser({
        name: 'Steve',
        sites: ['WL', 'TM'],
      });
    }, 2000);
  });

  // Most callers may assume the user is defined
  // because if it is not defined, then we will show the login screen and nothing else
  return user as UserData;
}
