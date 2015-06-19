import Ember from 'ember';
import SparseArray from 'ember-cli-sparse-array/addon/lib/index';

export default SparseArray.extend({

    // Consumer MUST set this value in `extend`
    type: null,

    // Batch size cannot be 1 or 2...
    //  because `SparseArray` is trained to ignore the last index...
    // FIXME: It would really be nice to have the ability to have batch
    //  sizes of 2 or 4, but it's impossible because this class will
    //  never fetch the 3rd or 5th objects, respectively, if it should happen
    //  that the `totalSize` of the data set is 3 or 5 in the service.
    // @see this.obejctAt() (and how it seeks to prevent `lastObject` from
    //  getting cached)
    batchSize: 25,

    currentPage: 1,

    params: null,

    defaultParams: function() {
        return {};
    }.property(),

    load: function(offset, limit) {

        var currentPage = this._pageForIndex(offset),
            defaultParams = this.get('defaultParams'),
            params = Ember.merge(defaultParams, {
                page: currentPage,
                rows: limit
            });

        this.set('currentPage', currentPage);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            this.get('store').find(this.get('type'), params).then(
                function(array) {
                    var total = array.get('meta.totalEntries') || array.get('length'),
                        meta = array.get('meta');

                    resolve({items: array.get('content'), total: total, meta: meta});

                }.bind(this),
                function(reason) {
                    console.log('We failed you: ', reason);
                    this.get('errors').pushObject(reason);
                    reject(reason);
                }.bind(this)
            );
        }.bind(this));
    }
});