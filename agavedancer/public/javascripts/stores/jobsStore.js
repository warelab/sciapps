'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import JobsActions from  '../actions/jobsActions.js';

const JobsStore=Reflux.createStore({
	listenables: JobsActions,

	init: function() {
		this.state={
			showJob: false,
			jobs: [],
			jobDetail: {},
			jobResults: {}
		};
		this.jobDetailCache={};
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	submitJob: function(appId, formData) {
		let submitNumber=this.state.jobs.length;
		this.state.jobs[submitNumber]={appId: appId};
		this.complete();
		axios.post('/job/new/' + appId , formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		})
		.then(function(res) {
			this.state.jobs[submitNumber]=res.data;
			this.complete();
		}.bind(this))
		.catch(function(res) {
				console.log(res);
		})
	},

	showJob: function(jobId) {
		if (! this.state.showJob) {
			this.state.showJob=true;
			this.complete();
		}
		let jobDetail=_.get(this.jobDetailCache, jobId);
		if (jobDetail) {
			this.state.jobDetail=jobDetail;
			this.complete();
		} else {
			axios.get('/job/' + jobId, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				this.state.jobDetail=res.data;
				if(_.includes(['FINISHED','FAILED'], res.data.status)) {
					_.set(this.jobDetailCache, res.data.id, res.data);
				}
				this.complete();
			}.bind(this))
			.catch(function(res) {
					console.log(res);
			});
		}
	},

	hideJob: function() {
		if (this.state.showJob) {
			this.state.showJob=false;
			this.complete();
		}
	},

	showJobResults: function(jobId) {
		let jobDetail=_.get(this.jobDetailCache, jobId);
		let promise;
		if (jobDetail) {
			promise=Q.fcall(function() {
				return jobDetail;
			});
		} else {
			promise=axios.get('/job/' + jobId, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				if(_.includes(['FINISHED','FAILED'], res.data.status)) {
					_.set(this.jobDetailCache, res.data.id, res.data);
				}
				return res.data;
			}.bind(this));
		}
		if (_.has(this.state.jobResults, jobId)) {
			this.complete();
		} else {
			promise.then(function(jobDetail) {
				let path='system/' + jobDetail.archiveSystem + '/' + jobDetail.archivePath;
				axios.get('/browse/' + path, {
					headers: {'X-Requested-With': 'XMLHttpRequest'},
				})
				.then(function(res) {
					let results=res.data[0].list.filter(function(result) {
						return ! result.name.startsWith('.');
					});
					return results;
				})
				.then(function(results) {
					_.set(this.state.jobResults, jobId, results);
					this.complete()
				}.bind(this))
			}.bind(this))
			.catch(function(res) {
				console.log(res);
			})
		}
	}
});

module.exports = JobsStore;
