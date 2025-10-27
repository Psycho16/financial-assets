import { observer } from 'mobx-react-lite'
import { assetStore } from '../stores/AssetStore'
import styles from './AssetsList.module.scss'
import { formatNumber } from '../utils/numberFormat'

export const AssetsList = observer(function AssetsList() {
  if (assetStore.assets.length === 0) {
    return <div className={styles.empty}>Нет активов</div>
  }
  return (
    <div className={styles.list}>
      {assetStore.assets.map(a => (
        <div key={a.id} className={styles.item}>
          <div className={styles.name}>{a.name}</div>
          <div className={styles.category}>{a.category}</div>
          <div className={styles.amount}>{formatNumber(a.amount)}</div>
          <button className={styles.remove} onClick={() => assetStore.removeAsset(a.id)}>Удалить</button>
        </div>
      ))}
      {assetStore.assets.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.totalLabel}>Итого</div>
          <div className={styles.totalValue}>{formatNumber(assetStore.totalAmount)}</div>
          <button className={styles.clear} onClick={() => assetStore.clearAll()}>Очистить</button>
        </div>
      )}
    </div>
  )
})


