import Service, {inject as service} from '@ember/service';
import TradeMap from 'pow/models/trade-map';
import TRADE_API from 'pow/constants/trade-api';

// Constants
const BASE_QUERY = {
  query: {
    status: {
      option: 'online'
    },
    type: {
      option: '__MAP_NAME__',
      discriminator: TRADE_API.VERSION_DISCRIMINATOR
    }
  },
  sort: {
    price: 'asc'
  }
};

export default Service.extend({
  request: service('request'),

  fetchFromName(mapName) {
    const request = this.get('request');
    const league = 'Incursion'; // TODO: Replace with proper league setting

    return request.fetch(`${TRADE_API.BASE_URL}/search/${league}?source=${this._queryParamFor(mapName)}`).then(({result: mapIds, total}) => {
      if (!mapIds.length) return {maps: [], nextMapIds: [], total};

      const mapIdsParam = mapIds.splice(0, TRADE_API.BATCH_SIZE).join(',');

      return request.fetch(`${TRADE_API.BASE_URL}/fetch/${mapIdsParam}`).then(({result: mapResults}) => ({
        tradeMaps: this._buildMaps(mapResults),
        nextTradeMapIds: mapIds,
        total
      }));
    });
  },

  fetchFromIds(mapIds) {
    const request = this.get('request');
    const mapIdsParam = mapIds.splice(0, TRADE_API.BATCH_SIZE).join(',');

    return request.fetch(`${TRADE_API.BASE_URL}/fetch/${mapIdsParam}`).then(({result: mapResults}) => ({
      tradeMaps: this._buildMaps(mapResults),
      nextTradeMapIds: mapIds
    }));
  },

  _queryParamFor(mapName) {
    return JSON.stringify(BASE_QUERY).replace('__MAP_NAME__', mapName);
  },

  /* eslint-disable complexity */
  _buildMaps(mapResults) {
    return mapResults.map((mapResult) => {
      const iiqProperty = mapResult.item.properties.find(({name}) => /quantity/i.test(name));
      const iirProperty = mapResult.item.properties.find(({name}) => /rarity/i.test(name));
      const mpsProperty = mapResult.item.properties.find(({name}) => /monster/i.test(name));

      return TradeMap.create({
        id: mapResult.id,
        rarity: TRADE_API.FRAME_TYPES_RARITY_MAP[mapResult.item.frameType],
        corrupted: mapResult.item.corrupted || false,
        identified: mapResult.item.identified || false,
        verified: mapResult.item.verified || false,
        mods: mapResult.item.explicitMods,
        itemQuantity: iiqProperty ? iiqProperty.values[0][0] : null,
        itemRarity: iirProperty ? iirProperty.values[0][0] : null,
        monsterPackSize: mpsProperty ? mpsProperty.values[0][0] : null,
        indexedAt: mapResult.listing.indexed,
        whisper: mapResult.listing.whisper,
        account: mapResult.listing.account.name,
        priceAmount: mapResult.listing.price.amount,
        priceCurrency: mapResult.listing.price.currency
      });
    });
  }
  /* eslint-enable complexity */
});