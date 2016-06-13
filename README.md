# cognito-awsume
An (currently hack-erific) implementation to provision / get temp creds for a Cognito User Pools in the CLI.

This is probably the single most ugly thing I have ever written. It's a temporary bandaid on the gushing wound that is AWS Cognito w/ User Roles.

Clone repo, go to it. Configure constants near top of file. Uncomment functions a but further down `signIn`, `signUp`, etc as needed and run `node index.js`.

Willing to expand more and take PRs. This is a huge repo because of baked in deps and various hacks. My sincere apologies.

We won't speak of this, look at this, or hear about this ever again.  
![Hear no evil, see no evil, speak no evil, ](http://vignette3.wikia.nocookie.net/metalgear/images/7/7f/Hear-No-Evil-See-No-Evil-Speak-No-Evil.jpg/revision/latest?cb=20140110032442)
