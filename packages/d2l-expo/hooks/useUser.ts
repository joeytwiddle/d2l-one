import { useGetUserQuery, User } from '../graphql';

export default function useUser() {
  /*
  const [user, setUser] = useState<UserData | null>(null);

  React.useEffect(() => {
    setTimeout(() => {
      setUser({
        name: 'Steve',
        sites: ['WL', 'TM'],
      });
    }, 2000);
  }, [user?.name]);
  */

  const user = useGetUserQuery().data?.me;

  // Most callers may assume the user is defined
  // because if it is not defined, then we will show the login screen and nothing else
  return user as User;
}
