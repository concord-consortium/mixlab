var WebPageApp;
(function (WebPageApp) {
    function createCallback(deferred) {
        return function (err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        };
    }

    (function (UserEditMode) {
        UserEditMode[UserEditMode["Preview"] = 0] = "Preview";
        UserEditMode[UserEditMode["Edit"] = 1] = "Edit";
    })(WebPageApp.UserEditMode || (WebPageApp.UserEditMode = {}));
    var UserEditMode = WebPageApp.UserEditMode;

    var AppViewModel = (function () {
        function AppViewModel(mode) {
            var _this = this;
            this._modeSwitchP = $.when();
            this.error = ko.observable(false);
            this.uri = ko.observable("");
            this.userEditMode = ko.observable(UserEditMode.Edit);
            this.labMode = ko.observable(null);

            this.absoluteUri = ko.computed(function () {
                // Hard Coded -- todo, move to prop
                return "http://lab.concord.org/embeddable.html#interactives/basic-examples/area-versus-applied-pressure.json";
                // return 'https://' + _this.uri();
            });

            this.switchEditModeText = ko.computed(function () {
                return _this.userEditMode() === UserEditMode.Preview ? UserEditMode[UserEditMode.Edit] : UserEditMode[UserEditMode.Preview];
            });

            this.appTemplate = ko.computed(function () {
                var error = _this.error();
                var labMode = _this.labMode();

                if (error) {
                    return "errorTemplate";
                } else if (labMode === null) {
                    return "loadingTemplate";
                } else {
                    return "appTemplate";
                }
            });

            this.showWebPage = ko.computed(function () {
                return _this.labMode() === Labs.Core.LabMode.View || _this.userEditMode() === UserEditMode.Preview;
            });

            Labs.on(Labs.Core.EventTypes.ModeChanged, function (data) {
                var modeChangedEvent = data;
                _this.switchToMode(Labs.Core.LabMode[modeChangedEvent.mode]);
            });

            this.uri.subscribe(function (newValue) {
                if (_this._labEditor) {
                    var configuration = _this.getConfigurationFromUri(newValue);
                    _this._labEditor.setConfiguration(configuration, function (setConfigurationErr, unused) {
                        if (setConfigurationErr) {
                            _this.error(true);
                        }
                    });
                }
            });

            this.switchToMode(mode);
        }
        AppViewModel.prototype.switchUserMode = function () {
            this.userEditMode(this.userEditMode() === UserEditMode.Preview ? UserEditMode.Edit : UserEditMode.Preview);
        };

        AppViewModel.prototype.switchToMode = function (mode) {
            var _this = this;
            this._modeSwitchP = this._modeSwitchP.then(function () {
                var switchedStateDeferred = $.Deferred();

                if (_this._labInstance) {
                    _this._labInstance.done(createCallback(switchedStateDeferred));
                } else if (_this._labEditor) {
                    _this._labEditor.done(createCallback(switchedStateDeferred));
                } else {
                    switchedStateDeferred.resolve();
                }

                return switchedStateDeferred.promise().then(function () {
                    _this._labEditor = null;
                    _this._labInstance = null;

                    if (mode === Labs.Core.LabMode.Edit) {
                        return _this.switchToEditMode();
                    } else {
                        return _this.switchToShowMode();
                    }
                });
            });

            this._modeSwitchP.fail(function () {
                return _this.error(true);
            });
        };

        AppViewModel.prototype.switchToEditMode = function () {
            var _this = this;
            var editLabDeferred = $.Deferred();
            Labs.editLab(createCallback(editLabDeferred));

            return editLabDeferred.promise().then(function (labEditor) {
                _this._labEditor = labEditor;

                var configurationDeferred = $.Deferred();
                labEditor.getConfiguration(createCallback(configurationDeferred));

                return configurationDeferred.promise().then(function (configuration) {
                    if (configuration) {
                        _this.uri((configuration.components[0]).data.uri);
                    } else {
                        _this.uri("www.wikipedia.org");
                    }

                    _this.labMode(Labs.Core.LabMode.Edit);
                });
            });
        };

        AppViewModel.prototype.switchToShowMode = function () {
            var _this = this;
            var takeLabDeferred = $.Deferred();
            Labs.takeLab(createCallback(takeLabDeferred));

            return takeLabDeferred.promise().then(function (labInstance) {
                _this._labInstance = labInstance;

                var activityComponentInstance = _this._labInstance.components[0];
                _this.uri(activityComponentInstance.component.data.uri);

                var attemptsDeferred = $.Deferred();
                activityComponentInstance.getAttempts(createCallback(attemptsDeferred));
                var attemptP = attemptsDeferred.promise().then(function (attempts) {
                    var currentAttemptDeferred = $.Deferred();
                    if (attempts.length > 0) {
                        currentAttemptDeferred.resolve(attempts[attempts.length - 1]);
                    } else {
                        activityComponentInstance.createAttempt(createCallback(currentAttemptDeferred));
                    }

                    return currentAttemptDeferred.then(function (currentAttempt) {
                        var resumeDeferred = $.Deferred();
                        currentAttempt.resume(createCallback(resumeDeferred));
                        return resumeDeferred.promise().then(function () {
                            return currentAttempt;
                        });
                    });
                });

                return attemptP.then(function (attempt) {
                    var completeDeferred = $.Deferred();
                    if (attempt.getState() !== Labs.ProblemState.Completed) {
                        attempt.complete(createCallback(completeDeferred));
                    } else {
                        completeDeferred.resolve();
                    }
                    _this.labMode(Labs.Core.LabMode.View);
                    return completeDeferred.promise();
                });
            });
        };

        AppViewModel.prototype.getConfigurationFromUri = function (uri) {
            var appVersion = { major: 1, minor: 0 };
            var configurationName = uri;
            var activityComponent = {
                type: Labs.Components.ActivityComponentType,
                name: uri,
                values: {},
                data: {
                    uri: uri
                },
                secure: false
            };
            var configuration = {
                appVersion: appVersion,
                components: [activityComponent],
                name: configurationName,
                timeline: null,
                analytics: null
            };

            return configuration;
        };
        return AppViewModel;
    })();

    $(document).ready(function () {
        Labs.connect(function (err, connectionResponse) {
            var viewModel = new AppViewModel(connectionResponse.mode);
            ko.applyBindings(viewModel);
        });
    });
})(WebPageApp || (WebPageApp = {}));