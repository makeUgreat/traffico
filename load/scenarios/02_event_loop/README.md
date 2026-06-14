# 2026.05.26 Stress Test #2

## 인프라 정보

| 노드 | 장비/BIOS | CPU | 메모리 | 디스크 | 루트 FS 사용량 | 물리 NIC | k3s 역할 |
|------|-----------|-----|--------|--------|----------------|----------|-------|
| n97 (`hash-n97-1`) | GMKtec NucBoxG5, BIOS G5_V1.01 | Intel N97, 4C/4T, 0.8-3.6GHz, L3 6MiB | 11GiB, swap 4GiB | SATA SSD 238.5GiB (`EAGET SSD Device`) | ext4 LVM 100GiB 중 20GiB 사용, 74GiB 여유 | `enp2s0` 1Gbps full-duplex, Wi-Fi `wlp1s0` down |
| n100 (`hash-n100-1`) | GMKtec NucBox G2, BIOS ANB02_GMK | Intel N100, 4C/4T, 0.7-3.4GHz, L3 6MiB | 11GiB, swap 4GiB | SATA SSD 476.9GiB (`TWSC TSC10N512-H`) | ext4 LVM 100GiB 중 19GiB 사용, 75GiB 여유 | `enp1s0` 1Gbps full-duplex, `enp3s0` down  |
| n150 (`hash-n150-1`) | DMI 제조사/모델 미기록, BIOS TWL_P0_AK_10_0106 | Intel N150, 4C/4T, 0.7-3.6GHz, L3 6MiB | 15GiB, swap 4GiB | SATA SSD 476.9GiB (`N900-512`) | ext4 LVM 100GiB 중 45GiB 사용, 49GiB 여유 | `enp1s0` 1Gbps full-duplex, Wi-Fi `wlp2s0` down  |

## 실험 목적
- Node Event Loop 동작에서 CPU Blocking이 throughput을 얼마나 저하시키는지 측정하여 그 영향도를 인지한다.
- 나의 인프라 환경에서 Node의 throughput을 측정하고 네트워크 대역폭과 Node CPU Computing 중 어떤것이 더 병목인지 확인 및 최대치를 인지한다.

### 시나리오 #1


### 시나링
