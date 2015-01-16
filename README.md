

## CC [Lab Framework][lab] activity integration with [Office Mix][mix] via [Labs][labs_readme]

> For the CC Lab interactive, I think the best approach to get this
> working quickly is to use an extra iframe. This is the same way that
> PhET and Kahn is integrated with Office Mix. So we make a new page
> that includes the labs.js library and iframe-phone, and it embeds Lab
> interactives inside an iframe. If labs.js is easy to use, this should
> be really quick to do. Kurt should be able to help if you run into any
> problems. - Scytacki 2015-01-15

### References:

#### Microsoft Labs:

* [labs github repo][labs_github]
* [labs host test harness][labs_host]
* [labs documentation][labs_readme]
* [labs example][labs_example]

#### Concord Lab:

* [Lab Framework][lab]
* [Lab Examples][lab_examples]
* [start empty example][start_empty]
* [pressure example][pressure]




[mix]: https://mix.office.com/
[labs_github]: https://github.com/OfficeDev/labs.js
[labs_host]: https://labsjs.blob.core.windows.net/sdk/LabsJS-1.0.4/labshost.html
[labs_readme]: https://labsjs.blob.core.windows.net/sdk/LabsJS-1.0.4/labs.html
[labs_example]: https://labsjs.blob.core.windows.net/sdk/LabsJS-1.0.4/labshost.html?lab=https://athenadevapps.cloudapp.net/Quiz/MultipleChoice?PostMessageLabHost
[lab]: https://github.com/concord-consortium/lab
[lab_examples]: https://github.com/concord-consortium/lab
[pressure]:http://lab.concord.org/embeddable.html#interactives/basic-examples/area-versus-applied-pressure.json
[start_empty]: http://concord-consortium.github.io/lab-examples/pages/03-start-empty.html