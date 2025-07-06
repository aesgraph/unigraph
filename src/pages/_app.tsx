// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import { supabase } from "../utils/supabaseClient";

// function MyApp({ Component, pageProps }) {
//   const [session, setSession] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     setSession(supabase.auth.getSession());
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setSession(session);
//         if (!session && router.pathname !== "/SignIn") {
//           router.push("/SignIn");
//         }
//       }
//     );
//     return () => {
//       listener?.subscription.unsubscribe();
//     };
//   }, [router]);

//   // Optionally, block rendering until session is checked
//   // if (router.pathname !== "/SignIn" && !session) {
//   //   return null; // or a loading spinner
//   // }

//   return <Component {...pageProps} />;
// }

// export default MyApp;
